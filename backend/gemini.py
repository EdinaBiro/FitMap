from google.oauth2 import service_account
from google.cloud import gemini

credentials = service_account.Credentials.from_service_account_file('C:\Allamvizsga\FitMap\fitmap-449621-6a3bd03735b5.json')

client = gemini.GeminiClient(credentals=credentials)