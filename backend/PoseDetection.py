import cv2
import numpy as np
import mediapipe as mp
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

counter = 0
stage = None
posture_feedback = "Stand straight"
posture_correct = True

cap = cv2.VideoCapture(0)

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



with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    while cap.isOpened:
        ret, frame = cap.read()

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)
        image.flags.writeable = True
        image= cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        try:

            landmarks = results.pose_landmarks.landmark
            posture_feedback, posture_correct = check_posture(landmarks)
            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            angle = calculate_angle(shoulder, elbow, wrist)
            cv2.putText(image, str(angle),
                        tuple(np.multiply(elbow,[640,480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 2, cv2.LINE_AA)
           
            if angle > 160:
             stage = "down"
            if angle < 30 and stage == "down":
                stage="up"
                if posture_correct:
                    counter +=1
                    print(f"Good rep: {counter}")
                else:
                    print(f"Bas posture: {posture_feedback}")
            
            #print(landmarks)

        except:
            pass

        cv2.rectangle(image, (10,10), (200,80), (245, 117,16), -1)

        cv2.putText(image, 'REPS',(15,12),
                    cv2.FONT_HERSHEY_SIMPLEX,0.5, (0,0,0),1, cv2.LINE_AA)
        cv2.putText(image, str(counter), (10,10), cv2.FONT_HERSHEY_SIMPLEX,2, (255,255,255), 2, cv2.LINE_AA)


        cv2.putText(image, 'STAGE',(65,12),
                    cv2.FONT_HERSHEY_SIMPLEX,0.5, (0,0,0),1, cv2.LINE_AA)
        cv2.putText(image, str(counter), (60,60), cv2.FONT_HERSHEY_SIMPLEX,2, (255,255,255), 2, cv2.LINE_AA)

        feedback_color = (0,255,0) if posture_correct else (0,0,255)
        cv2.rectangle(image, (10,100), (630, 140), (245, 117, 16), -1)
        cv2.putText(image, 'PSOTURE', (15,120),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1, cv2.LINE_AA)
        cv2.putText(image, posture_feedback, (130, 125),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, feedback_color, 2, cv2.LINE_AA)


        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2),
                                mp_drawing.DrawingSpec(color=(245,66,230 ), thickness=2, circle_radius=2))


        #print(results)

        cv2.imshow("Image", image)

        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()