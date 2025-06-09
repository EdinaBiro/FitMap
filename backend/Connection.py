from flask import Flask,request,jsonify
import cv2
import numpy as np
import mediapipe as mp
import base64
from io import BytesIO
from PIL import Image
import os
import requests
import json


app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_ESTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

if not os.path.exists(UPLOAD_FOLDER):
    os.mkdirs(UPLOAD_FOLDER)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode = False,
    model_complexity=1,
    smooth_landmarks=True,
    enable_segmentation=False,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_ESTENSIONS

def calculate_angle(a,b,c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)

    if angle > 180.0:
        angle = 360 - angle
    
    return angle

def check_posture(landmarks):
    left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
    right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
    left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
    right_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
    left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
    right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]

    shoulder_slope = abs(left_shoulder[1] - right_shoulder[1])

    torso_angle_left = calculate_angle(left_shoulder, left_hip, [left_hip[0], 0])
    torso_angle_right = calculate_angle(right_shoulder, right_hip, [right_hip[0], 0])

    elbow_out_left = left_elbow[0] < left_shoulder[0] - 0.1
    elbow_out_right = right_elbow[0] > right_shoulder[0] + 0.1

    feedback = []
    posture_correct = True

    if shoulder_slope > 0.05:
        feedback.append("Level your shoulders")
        posture_correct = False
    if abs(90 - torso_angle_left) > 15 or abs(90 - torso_angle_right) > 15:
        feedback.append("Keep torso right")
        posture_correct = False
    if elbow_out_left or elbow_out_right:
        feedback.append("Keep elbows close to body")
        posture_correct = False

    return " | ".join(feedback) if feedback else "Good form", posture_correct

def extract_keypoints(landmarks):
    connections =[
        #torso
        (mp_pose.PoseLandmark.LEFT_SHOULDER.value,mp_pose.PoseLandmark.RIGHT_SHOULDER.value),
        (mp_pose.PoseLandmark.LEFT_SHOULDER.value,mp_pose.PoseLandmark.LEFT_HIP.value),
        (mp_pose.PoseLandmark.RIGHT_SHOULDER.value,mp_pose.PoseLandmark.RIGHT_HIP.value),
        (mp_pose.PoseLandmark.LEFT_HIP.value,mp_pose.PoseLandmark.RIGHT_HIP.value),

        #arms

        (mp_pose.PoseLandmark.LEFT_SHOULDER.value,mp_pose.PoseLandmark.RIGHT_ELBOW.value),
        (mp_pose.PoseLandmark.LEFT_ELBOW.value,mp_pose.PoseLandmark.RIGHT_WRIST.value),
        (mp_pose.PoseLandmark.RIGHT_SHOULDER.value,mp_pose.PoseLandmark.RIGHT_ELBOW.value),
        (mp_pose.PoseLandmark.RIGHT_ELBOW.value,mp_pose.PoseLandmark.RIGHT_WRIST.value),

        #legs

        (mp_pose.PoseLandmark.LEFT_HIP.value,mp_pose.PoseLandmark.LEFT_KNEE.value),
        (mp_pose.PoseLandmark.LEFT_KNEE.value,mp_pose.PoseLandmark.LEFT_ANKLE.value),
        (mp_pose.PoseLandmark.RIGHT_HIP.value,mp_pose.PoseLandmark.RIGHT_KNEE.value),
        (mp_pose.PoseLandmark.RIGHT_KNEE.value,mp_pose.PoseLandmark.RIGHT_ANKLE.value),
    ]

    keypoints = []
    for i, landmark in enumerate(landmarks):
        keypoints.append({
            "index" : i,
            "x" : landmark.x,
            "y": landmark.y,
            "visibility": landmark.visibility    
            })
    lines = []

    for start, end in connections:
        if(landmarks[start].visibility > 0.5 and landmarks[end].visibility > 0.5):
            lines.append({
                "from" : start,
                "to" : end
            })
    return {
        "points": keypoints,
        "connections" : lines
    }

def detect_exercise_type(landmarks):
    left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
    right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
    left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
    right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
    left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
    right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
    left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
    right_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
    left_knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
    right_knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
    left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
    right_ankle = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]

    knee_angle = calculate_angle(left_hip,left_knee, left_ankle)
    left_elbow_angle= calculate_angle(right_shoulder, right_elbow, right_wrist)
    right_elbow_angle= calculate_angle(left_shoulder, left_elbow, left_wrist)

    left_curl_postion = (left_wrist[1] < left_elbow[1]) and (left_elbow_angle < 140)
    right_curl_postion = (right_wrist[1] < right_elbow[1]) and (right_elbow_angle < 140)

    if left_curl_postion or right_curl_postion:
        return "bicep_curl"
    elif knee_angle < 120 and left_knee[1] < left_hip[1]:
        return "squat"
    elif left_elbow_angle < 90 and left_elbow[1] > left_shoulder[1]:
        return "pushup"
    else:
        return "unknown"
    
def prepare_landmark_data_for_deepseek(landmarks):
    landmark_data = []
    landmark_names = [name.name for name in mp_pose.PoseLandmark]

    for i, landmark in enumerate(landmarks):
        landmark_data.append({
            "name": landmark_names[i] if i < len(landmark_names) else f"POINT_{i}",
            "x": float(landmark.x),
            "y" : float(landmark.y),
            "z" :float(landmark.z),
            "visibility": float(landmark.visibility)
        })
    return landmark_data


def get_pose_landmarks(frame):
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(image_rgb)

    if not results.pose_landmarks:
        return None
    landmarks = []
    for landmark in results.pose_landmarks.landmark:
        landmarks.append({
            'x' : landmark.x,
            'y' : landmark.y,
            'z' : landmark.z,
            'visibility': landmark.visibility
        })

    return landmarks

def analyze_rep_movements(landmark_data, exercise_type):

    if not DEEPSEEK_API_KEY:
        print("Warning: api key not se")
        return {
            "success" : False,
            "message" : "Api key not configured"
        }
    
    simplified_data = []
    key_points= ["NOSE", "LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW",
                 "LEFT_WRIST", "RIGHT_WRIST", "LEFT_HIP", "RIGHT_HIP",
                 "LEFT_KNEE", "RIGHT_KNEE", "LEFT_ANKLE", "RIGHT_ANKLE"
                 ]
    
    for point in landmark_data:
        if point["name"] in key_points:
            simplified_data.append({
                "name": point["name"],
                "position" : [point["x"], point["y"]],
                "visbility": point["visibility"]
            })
    prompt = f"""
    You are an expert fitness trainer analyzing form. Based on the following skeletal position data, provide feedback on the user's {exercise_type} form:

    {json.dumps(simplified_data, indent=2)}
    Provide your analysis in this exact JSON format: 
    ({
        "feedback" : "Short, specific feedback about form issues",
        "correct" : true/false,
        "issues" : ["specific issue 1", "specific issue 2"],
        "stage" : "up/down/halfway",
        "improvement_tips":"Brief tip to improve form"
    })

    ONLY respond with valid JSON following the above structure. No addtitional text.
  
    """

    headers ={
        "Authorization" : f"Berarer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    playload = {
        "model" : "deepseek-chat",
        "messages" : [
            {"role": "user", "content" : prompt}
        ], 
        "temperature": 0.7,
        "response_format" : {"type": "json_object"}
    }
    
    try:
        response = requests.post(DEEPSEEK_API_URL, json=playload, headers=headers)
        if response.status_code == 200:
            content = response.json()
            if "choices" in content and len(content["choices"]) > 0:
                feedback_text = content["choices"][0]["message"]["content"]
                feedback_json = json.loads(feedback_text)
                return{
                    "success" : True,
                    "feedback" : feedback_json["feedback"],
                    "correct" : feedback_json["correct"],
                    "issues" : feedback_json["issues"],
                    "stage" : feedback_json["stage"],
                    "improvement_tips": feedback_json["improvement_tips"]
                }
        return {
            "success": False,
            "message": f"API Error : {response.status_code}",
            "details" : response.text
        }
    except Exception as e:
        return{
            "success" : False,
            "message": f"Error: {str(e)}"
,
        }


@app.route('/analyze_pose', methods=['POST'])
def analyze_pose():
    if 'image' not in request.json:
        return jsonify({'error': 'No image provided'}), 400
    
    img_data = request.json['image']
    try:
        img_bytes = base64.b64decode(img_data)
        img_pil = Image.open(BytesIO(img_bytes))
        img_np = np.array(img_pil)

        if len(img_np.shape) == 2:
            img_rgb = cv2.cvtColor(img_np, cv2.COLOR_GRAY2BGR)
        elif len(img_np.shape) == 3 and img_np.shape[2] == 4:
            img_rgb = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
        elif len(img_np.shape) == 3 and img_np.shape[2] == 3:
            img_rgb = img_np
        else:
            return jsonify({
                'detected' : False,
                'message' : 'Unsupported image format'
            })
            
        results = pose.process(img_rgb)

        if not results.pose_landmarks:
            return jsonify({
                'detected': False,
                'message': 'No pose detected'
            })
        landmarks = results.pose_landmarks.landmark

        key_landmarks = [
            mp_pose.PoseMark.LEFT_SHOULDER.value,
            mp_pose.PoseMark.RIGHT_SHOULDER.value,
            mp_pose.PoseMark.LEFT_ELBOW.value,
            mp_pose.PoseMark.RIGHT_ELBOW.value,
            mp_pose.PoseMark.LEFT_WRIST.value,
            mp_pose.PoseMark.RIGHT_WRIST.value,
        ]

        visible_landmarks = sum(1 for i in key_landmarks if landmarks[i].visibility > 0.5)
        if visible_landmarks < 4:
            return jsonify({
                'detected': False,
                'message': 'Key points not visible enough'
            })

        exercise_type = detect_exercise_type(landmarks)
        posture_feedback, posture_correct = check_posture(landmarks)

        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        angle = calculate_angle(shoulder, elbow, wrist)

        stage = None
        if angle > 160:
            stage = "down"
        elif angle < 30 :
            stage="up"
        else:
            stage="halfway"

        keypoints_data = extract_keypoints(landmarks)

        response_data = {
            'detected': True,
            'angle': float(angle),
            'stage': stage,
            'posture_feedback': posture_feedback,
            'posture_correct': posture_correct,
            'keypoints': keypoints_data,
            'exercise_type': exercise_type
        }

        if DEEPSEEK_API_KEY:
            landmark_data = prepare_landmark_data_for_deepseek(landmarks)
            deepseek_analysis = query_deepseek(landmark_data, exercise_type)

            if deepseek_analysis["success"]:
                response_data.update({
                    'posture_feedback' : deepseek_analysis["feedback"],
                    'posture_correct' : deepseek_analysis["correct"],
                    "stage" : deepseek_analysis["stage"],
                    "issues" : deepseek_analysis["issues"],
                    "improvement_tips" : deepseek_analysis["improvement_tips"],
                    "using_ai" : True
                })
        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001)
                