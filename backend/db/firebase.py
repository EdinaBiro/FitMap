import firebase_admin
from firebase_admin import credentials, auth

# cred_path = "fitmap-84de1-firebase-adminsdk-fbsvc-8153f0b100.json"
cred_path = r"D:\FitMap\backend\fitmap-84de1-firebase-adminsdk-fbsvc-8153f0b100.json"

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

def     verify_firebase_token(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        print(f"decoded_token")
        return decoded_token
    except Exception as e:
        return None