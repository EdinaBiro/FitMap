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
import tempfile
from werkzeug.utils import secure_filename


app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}


if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

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
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

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
    def get_coords(landmark_name):
        lm = landmarks[mp_pose.PoseLandmark[landmark_name].value]
        return [lm.x, lm.y]

    # Get key joint coordinates
    left_shoulder = get_coords('LEFT_SHOULDER')
    right_shoulder = get_coords('RIGHT_SHOULDER')
    left_elbow = get_coords('LEFT_ELBOW')
    right_elbow = get_coords('RIGHT_ELBOW')
    left_wrist = get_coords('LEFT_WRIST')
    right_wrist = get_coords('RIGHT_WRIST')
    left_hip = get_coords('LEFT_HIP')
    right_hip = get_coords('RIGHT_HIP')
    left_knee = get_coords('LEFT_KNEE')
    right_knee = get_coords('RIGHT_KNEE')
    left_ankle = get_coords('LEFT_ANKLE')
    right_ankle = get_coords('RIGHT_ANKLE')

    # Calculate angles
    left_elbow_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
    right_elbow_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
    left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
    right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)

    # Heuristics
    is_left_curl = left_elbow_angle < 60 and left_wrist[1] < left_elbow[1] < left_shoulder[1]
    is_right_curl = right_elbow_angle < 60 and right_wrist[1] < right_elbow[1] < right_shoulder[1]

    is_squat = (
        left_knee_angle < 100 and right_knee_angle < 100 and
        left_knee[1] > left_hip[1] and right_knee[1] > right_hip[1]
    )

    is_pushup = (
        left_elbow_angle < 100 and right_elbow_angle < 100 and
        left_shoulder[1] < left_elbow[1] < left_wrist[1]
    )

    # Decision tree
    if is_left_curl or is_right_curl:
        return "bicep_curl"
    elif is_squat:
        return "squat"
    elif is_pushup:
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


def extract_pose_landmarks(frame):
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

def analyze_rep_movement(landmarks_sequence, exercise_type):
    if not landmarks_sequence or len(landmarks_sequence) < 5:
        return {
            'reps': 0,
            'correct_reps': 0,
            'incorrect_reps': 0,
            'feedback': [],
            'stages': []
        }

    reps = 0
    correct_reps = 0
    incorrect_reps = 0
    stages = []
    feedback_log = []
    current_stage = None
    in_rep = False
    min_angle = 180
    max_angle = 0

    for i, landmarks_dict in enumerate(landmarks_sequence):
        class MockLandmark:
            def __init__(self, x, y, z, visibility):
                self.x = x
                self.y = y
                self.z = z
                self.visibility = visibility

        landmarks = [MockLandmark(l['x'], l['y'], l['z'], l['visibility']) for l in landmarks_dict]

        if exercise_type == "bicep_curl":
            # Get both arms for more robust analysis
            left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                           landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            
            right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
            right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                          landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
            right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                          landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

            # Calculate angles for both arms
            left_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
            right_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
            
            # Use the arm with more movement (likely the one doing the curl)
            if abs(left_angle - right_angle) > 30:
                angle = min(left_angle, right_angle)  # The more bent arm
            else:
                angle = (left_angle + right_angle) / 2  # Average if both similar
            
            # Track min and max angles in current rep
            if in_rep:
                min_angle = min(min_angle, angle)
                max_angle = max(max_angle, angle)
            
            # Determine stage
            if angle > 150:
                stage = "down"
            elif angle < 40:
                stage = "up"
            else:
                stage = "transition"
            
            stages.append(stage)
            
            # Rep counting logic
            if not in_rep and stage == "up":
                in_rep = True  # Start of a rep
                min_angle = angle
                max_angle = angle
            elif in_rep and stage == "down" and max_angle - min_angle > 80:  # Minimum range of motion
                reps += 1
                in_rep = False
                
                # Check form at the top of the rep
                feedback, correct = check_posture(landmarks)
                feedback_log.append(feedback)
                
                if correct:
                    correct_reps += 1
                else:
                    incorrect_reps += 1
            
            current_stage = stage

    return {
        'reps': reps,
        'correct_reps': correct_reps,
        'incorrect_reps': incorrect_reps,
        'feedback': feedback_log,
        'stages': stages
    }


def summarize_pose_data(landmarks_sequence, exercise_type):
    if not landmarks_sequence:
        return "No pose data available"
    
    key_points = ["LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW", "LEFT_WRIST", "RIGHT_WRIST", "LEFT_HIP", "RIGHT_HIP", "LEFT_KNEE", "RIGHT_KNEE"]

    summary = {
        "exercise_type": exercise_type,
        "total_frames": len(landmarks_sequence),
        "key_observations": []
    }

    frames_to_analyze = [0, len(landmarks_sequence)//2, -1]

    for i, frame_idx in enumerate(frames_to_analyze):
        if frame_idx < len(landmarks_sequence):
            landmarks = landmarks_sequence[frame_idx]
            frame_name = ["start", "middle", "end"][i]

            if exercise_type == "bicep_curl":
                left_shoulder = landmarks[11]
                left_elbow = landmarks[13]
                left_wrist = landmarks[15]

                angle = calculate_angle(
                    [left_shoulder['x'], left_shoulder['y']],
                    [left_elbow['x'], left_elbow['y']],
                    [left_wrist['x'], left_wrist['y']]
                )

                summary["key_observations"].append(f"{frame_name}_elbow_angle: {angle: 1.f}°")
    return json.dumps(summary, indent=2)

def generate_ai_feedback(exercise_type,landmarks_sequence,rep_analysis):

    if not DEEPSEEK_API_KEY:
        print("Warning: api key not se")
        return {
            "success" : False,
            "message" : "Api key not configured"
        }
    
    pose_summary = summarize_pose_data(landmarks_sequence, exercise_type)
    prompt = f"""
    You are an expert fitness trainer analyzing form. The user performed '{exercise_type}'

    Analysis Results:
    - Total Reps: {rep_analysis['reps']}
    - Correct Form Reps: {rep_analysis['correct_reps']}
    - Poor Form Reps: {rep_analysis['incorrect_reps']}
    
    Pose Data Summary:
    {pose_summary}
    
    Provide constructive feedback in this exact JSON format:
    {{
        "feedback": "Overall assessment of the exercise performance",
        "correct": true/false,
        "issues": ["specific issue 1", "specific issue 2"],
        "improvement_tips": "Specific tips to improve form and technique",
        "positive_points": "What the user did well"
    }}
    
    ONLY respond with valid JSON following the above structure. No additional text.
    """
    
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "response_format": {"type": "json_object"}
    }
    
    try:
        response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=30)
        if response.status_code == 200:
            content = response.json()
            if "choices" in content and len(content["choices"]) > 0:
                feedback_text = content["choices"][0]["message"]["content"]
                feedback_json = json.loads(feedback_text)
                return {
                    "success": True,
                    **feedback_json
                }
        return {
            "success": False,
            "message": f"API Error: {response.status_code}",
            "details": response.text
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }

def process_video_with_mediapipe(video_path, exercise_type):
    """Process video with MediaPipe and analyze exercise"""
    cap = cv2.VideoCapture(video_path)
    all_landmarks = []
    frame_count = 0
    
    print(f"Processing video: {video_path}")
    print(f"Exercise type: {exercise_type}")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
    
        if frame_count % 3 == 0:
            landmarks = extract_pose_landmarks(frame)
            if landmarks:
                all_landmarks.append(landmarks)
    
    cap.release()
    
    print(f"Processed {frame_count} frames, extracted {len(all_landmarks)} landmark sets")
    
    if not all_landmarks:
        return {
            "success": False,
            "message": "No pose detected in video",
            "total_reps": 0,
            "correct_reps": 0,
            "incorrect_reps": 0
        }
    
    rep_analysis = analyze_rep_movement(all_landmarks, exercise_type)

    ai_feedback = generate_ai_feedback(exercise_type, all_landmarks, rep_analysis)
    
    result = {
        "success": True,
        "exercise_type": exercise_type,
        "total_reps": rep_analysis['reps'],
        "correct_reps": rep_analysis['correct_reps'],
        "incorrect_reps": rep_analysis['incorrect_reps'],
        "total_frames_analyzed": len(all_landmarks)
    }
    
    if ai_feedback["success"]:
        result.update({
            "feedback": ai_feedback.get("feedback", "Good job!"),
            "issues": ai_feedback.get("issues", []),
            "improvement_tips": ai_feedback.get("improvement_tips", "Keep up the good work!"),
            "positive_points": ai_feedback.get("positive_points", "Great effort!"),
            "using_ai": True
        })
    else:
        result.update({
            "feedback": f"Completed {rep_analysis['reps']} reps with {rep_analysis['correct_reps']} good form",
            "issues": [],
            "improvement_tips": "Focus on maintaining proper form throughout the movement",
            "using_ai": False
        })
    
    return result

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
                'detected': False,
                'message': 'Unsupported image format'
            })
            
        results = pose.process(img_rgb)

        if not results.pose_landmarks:
            return jsonify({
                'detected': False,
                'message': 'No pose detected'
            })

        landmarks = results.pose_landmarks.landmark
        exercise_type = detect_exercise_type(landmarks)
        posture_feedback, posture_correct = check_posture(landmarks)

        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        angle = calculate_angle(shoulder, elbow, wrist)

        stage = None
        if angle > 160:
            stage = "down"
        elif angle < 30:
            stage = "up"
        else:
            stage = "halfway"

        response_data = {
            'detected': True,
            'angle': float(angle),
            'stage': stage,
            'posture_feedback': posture_feedback,
            'posture_correct': posture_correct,
            'exercise_type': exercise_type
        }

        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/analyze-video', methods=['POST'])
def analyze_video():
    if 'video' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        cap = cv2.VideoCapture(filepath)
        frame_count = 0
        landmark_sequence = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1
            if frame_count % 5 != 0:
                continue

            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = pose.process(image_rgb)

            if result.pose_landmarks:
                landmarks = []
                for lm in result.pose_landmarks.landmark:
                    landmarks.append({
                        'x': lm.x,
                        'y': lm.y,
                        'z': lm.z,
                        'visibility': lm.visibility
                    })
                landmark_sequence.append(landmarks)

        cap.release()
        os.remove(filepath)

        if not landmark_sequence:
            return jsonify({"error": "No poses detected in video"}), 400

        exercise_type = detect_exercise_type(result.pose_landmarks.landmark)
        analysis = analyze_rep_movement(landmark_sequence, exercise_type)
        return jsonify({
            "exercise": exercise_type,
            "correct_reps": analysis.get("correct_reps", 0),
            "incorrect_reps": analysis.get("incorrect_reps", 0),
            "reps": analysis.get("correct_reps", 0) + analysis.get("incorrect_reps", 0) ,
        })
      

    return jsonify({"error": "File type not allowed"}), 400

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001)
                