#!/usr/bin/env python3
"""
Generate a professional favicon for MathMentorAI
"""
from PIL import Image, ImageDraw, ImageFont
import math
import os

def create_favicon():
    # Create 64x64 image with transparent background
    size = 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw mathematical symbol (integral sign with brain)
    center = size // 2
    radius = 20
    
    # Draw brain outline
    draw.ellipse((center-radius, center-radius, center+radius, center+radius), 
                fill=(102, 126, 234, 255), outline=(82, 106, 214, 255), width=3)
    
    # Draw mathematical symbols inside
    draw.line((center-10, center-5, center+10, center-5), fill=(255, 255, 255, 255), width=3)
    draw.line((center-8, center+5, center+8, center+5), fill=(255, 255, 255, 255), width=3)
    draw.line((center, center-8, center, center+8), fill=(255, 255, 255, 255), width=2)
    
    # Save as favicon
    img.save('frontend/public/favicon.ico', format='ICO', sizes=[(64, 64), (32, 32), (16, 16)])
    print("✅ Favicon generated successfully!")

if __name__ == '__main__':
    create_favicon()