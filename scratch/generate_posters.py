"""
Generate beautiful movie poster placeholder images for missing posters.
Uses PIL to create gradient posters with movie title and emoji.
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont
import struct

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join(c*2 for c in hex_color)
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def lerp_color(c1, c2, t):
    """Linearly interpolate between two RGB colors."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def create_gradient_poster(movie, output_path):
    """Create a stylized gradient poster image for a movie."""
    width, height = 400, 600
    
    # Get colors
    poster_color = movie.get('posterColor', {})
    color_from = hex_to_rgb(poster_color.get('from', '#1a1a3f'))
    color_to = hex_to_rgb(poster_color.get('to', '#0d0d2b'))
    
    # Create image
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background
    for y in range(height):
        t = y / height
        color = lerp_color(color_from, color_to, t)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Add a subtle overlay for depth
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    # Add some star-like dots
    import random
    random.seed(movie['id'] * 7)
    for _ in range(60):
        x = random.randint(0, width)
        y = random.randint(0, height // 2)
        r = random.randint(1, 3)
        alpha = random.randint(100, 200)
        overlay_draw.ellipse([x-r, y-r, x+r, y+r], fill=(255, 255, 255, alpha))
    
    # Composite
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, overlay)
    img = img.convert('RGB')
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fall back to default
    try:
        font_large = ImageFont.truetype("C:/Windows/Fonts/Arial.ttf", 48)
        font_title = ImageFont.truetype("C:/Windows/Fonts/Arialbd.ttf", 26)
        font_year = ImageFont.truetype("C:/Windows/Fonts/Arial.ttf", 18)
        font_small = ImageFont.truetype("C:/Windows/Fonts/Arial.ttf", 14)
    except:
        try:
            font_large = ImageFont.truetype("arial.ttf", 48)
            font_title = ImageFont.truetype("arialbd.ttf", 26)
            font_year = ImageFont.truetype("arial.ttf", 18)
            font_small = ImageFont.truetype("arial.ttf", 14)
        except:
            font_large = ImageFont.load_default()
            font_title = font_large
            font_year = font_large
            font_small = font_large
    
    # Draw poster emoji in center (large)
    poster_emoji = movie.get('poster', '🎬')
    # Draw emoji as text (may not render on all systems, use fallback)
    emoji_y = height // 3 - 40
    try:
        # Try to use a unicode-capable font
        emoji_font = ImageFont.truetype("C:/Windows/Fonts/Seguiemj.ttf", 80)
        draw.text((width//2, emoji_y), poster_emoji, font=emoji_font, fill=(255,255,255,230), anchor='mm')
    except:
        # Fallback: draw a circle
        cx, cy = width//2, emoji_y
        r = 50
        # Lighter color
        light = tuple(min(255, c + 80) for c in color_to)
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=light, outline=(255,255,255,150))
    
    # Draw separator line
    line_y = height // 2 - 20
    draw.line([(40, line_y), (width-40, line_y)], fill=(255, 255, 255, 80), width=1)
    
    # Draw title (wrapped)
    title = movie['title']
    year = str(movie['year'])
    
    # Word wrap title
    words = title.split()
    lines = []
    current_line = []
    for word in words:
        test_line = ' '.join(current_line + [word])
        try:
            bbox = draw.textbbox((0, 0), test_line, font=font_title)
            w = bbox[2] - bbox[0]
        except:
            w = len(test_line) * 15
        if w > width - 60 and current_line:
            lines.append(' '.join(current_line))
            current_line = [word]
        else:
            current_line.append(word)
    if current_line:
        lines.append(' '.join(current_line))
    
    # Draw title lines
    title_y = line_y + 20
    for line in lines[:3]:  # max 3 lines
        # Shadow
        draw.text((width//2 + 2, title_y + 2), line, font=font_title, fill=(0,0,0,180), anchor='mt')
        draw.text((width//2, title_y), line, font=font_title, fill=(255, 255, 255), anchor='mt')
        title_y += 35
    
    # Draw year
    draw.text((width//2, title_y + 8), year, font=font_year, fill=(180, 200, 230), anchor='mt')
    
    # Draw SciFiLens watermark at bottom
    draw.text((width//2, height - 20), 'SciFiLens', font=font_small, fill=(255, 255, 255, 100), anchor='mb')
    
    # Draw border/frame
    border_color = tuple(min(255, c + 60) for c in lerp_color(color_from, color_to, 0.5))
    draw.rectangle([2, 2, width-3, height-3], outline=border_color + (100,) if len(border_color) == 4 else border_color, width=2)
    
    # Save
    img.save(output_path, 'JPEG', quality=90)
    print(f"  Created: {os.path.basename(output_path)}")

def main():
    with open('data/movies.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    movies = data['movies']
    poster_dir = 'images/posters'
    existing_posters = set(os.listdir(poster_dir))
    
    created = 0
    for m in movies:
        fname = os.path.basename(m.get('posterUrl', ''))
        if not fname:
            continue
        
        fpath = os.path.join(poster_dir, fname)
        fsize = os.path.getsize(fpath) if fname in existing_posters else 0
        
        # Create if missing or too small (broken)
        if fname not in existing_posters or fsize < 1000:
            print(f"Creating poster for: {m['title']} (ID: {m['id']})")
            create_gradient_poster(m, fpath)
            created += 1
    
    print(f"\nCreated {created} poster images.")

if __name__ == '__main__':
    main()
