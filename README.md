# FitMap – AI-alapú Fitnesz Alkalmazás

Egy átfogó, AI-támogatott fitnesz alkalmazás, amely segíti a felhasználókat az edzéstervezésben, útvonalgenerálásban, mozgáskövetésben és gyakorlat-kiértékelésben.

## Funkciók

- 🔐 **Autentikáció**: Bejelentkezés Google, Facebook, email/jelszó alapján, regisztráció és jelszó-visszaállítás.
- 📝 **Kérdőív alapú edzésterv**: Az első indításkor kérdőív alapján személyre szabott edzésterv generálás.
- 🗺️ **Google Maps integráció**: Útvonalgenerálás a felhasználó aktuális lokációja alapján.
- 📅 **Naptár funkció**:
  - Edzéstervezés, időjárás-előrejelzés
  - Edzés adatok megtekintése, módosítása, törlése.
- 🎥 **Gyakorlat kiértékelés videó alapján**:
  - Mediapipe kulcspont detektálás.
  - DeepSeek AI elemzi a gyakorlatot, felismeri, számolja a helyes/helytelen ismétléseket.
- 🏃 **Mozgáskövetés**:
  - Séta, futás, biciklizés, túrázás GPS alapon.
  - Távolság, idő és egyéb metrikák számítása.
- 🏋️ **Generált edzéstervek** megtekintése.

## Tech stack

- **Frontend**: React Native (Expo)
- **Backend**: FastAPI (Python)
- **AI/ML**: Mediapipe, DeepSeek AI
- **Maps & GPS**: Google Maps API
- **Adatkezelés**: Python `Connection.py` kapcsolódik az adatbázishoz

## Indítási lépések

1. **Frontend (Expo – Android)**
   ```bash
   npx expo run:android
2. **Backend**
   ```bash
   python Connection.py
3. **Backend**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
