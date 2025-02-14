
def calculate_bmi(height: int, weight: float):
    if height is not None and weight is not None and height > 0 and weight > 0:
        height_m = float(height)/100
        bmi = weight / (height_m * height_m)
        return round(bmi,1)
    return None