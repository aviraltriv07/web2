import json
import os
import random
from PIL import Image, ImageDraw, ImageFont

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join(c*2 for c in hex_color)
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def create_poster(movie, output_path):
    width, height = 400, 600
    
    poster_color = movie.get('posterColor', {})
    color_from = hex_to_rgb(poster_color.get('from', '#1e293b'))
    color_to = hex_to_rgb(poster_color.get('to', '#0f172a'))
    
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # 1. Gradient background
    for y in range(height):
        t = y / height
        # Non-linear easing for richer depth
        t_ease = t * t * (3 - 2 * t)
        color = lerp_color(color_from, color_to, t_ease)
        draw.line([(0, y), (width, y)], fill=color)
    
    # 2. Add cosmic nebulae and stars
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    random.seed(movie['id'] * 13 + 42)
    # Nebular glow circles
    for _ in range(4):
        cx = random.randint(50, width - 50)
        cy = random.randint(80, 350)
        cr = random.randint(80, 160)
        glow_color = tuple(min(255, c + random.randint(40, 100)) for c in color_to) + (random.randint(25, 60),)
        overlay_draw.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], fill=glow_color)
    
    # Starfield dots
    for _ in range(75):
        x = random.randint(5, width - 5)
        y = random.randint(5, height - 100)
        r = random.choice([1, 1, 1, 2, 2, 3])
        alpha = random.randint(120, 240)
        overlay_draw.ellipse([x-r, y-r, x+r, y+r], fill=(255, 255, 255, alpha))
    
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(img)
    
    # Fonts
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/Arialbd.ttf", 26)
        font_year = ImageFont.truetype("C:/Windows/Fonts/Arial.ttf", 17)
        font_genre = ImageFont.truetype("C:/Windows/Fonts/Arial.ttf", 13)
        font_brand = ImageFont.truetype("C:/Windows/Fonts/Arialbd.ttf", 12)
        font_emoji = ImageFont.truetype("C:/Windows/Fonts/Seguiemj.ttf", 76)
    except:
        font_title = ImageFont.load_default()
        font_year = font_title
        font_genre = font_title
        font_brand = font_title
        font_emoji = font_title
    
    # 3. Draw central symbol / emoji
    poster_emoji = movie.get('poster', '🎬')
    emoji_y = int(height * 0.32)
    
    # Glowing backdrop circle for the icon
    cx, cy = width // 2, emoji_y
    r_disc = 56
    glow_disc = tuple(min(255, c + 35) for c in color_from)
    draw.ellipse([cx-r_disc, cy-r_disc, cx+r_disc, cy+r_disc], fill=glow_disc, outline=(255, 255, 255, 90), width=1)
    
    try:
        draw.text((cx, emoji_y), poster_emoji, font=font_emoji, fill=(255, 255, 255, 240), anchor='mm')
    except:
        draw.text((cx, emoji_y), "★", font=font_title, fill=(255, 255, 255, 240), anchor='mm')
    
    # 4. Cinematic divider
    div_y = int(height * 0.50)
    draw.line([(45, div_y), (width - 45, div_y)], fill=(255, 255, 255, 90), width=1)
    draw.ellipse([width//2 - 4, div_y - 4, width//2 + 4, div_y + 4], fill=(255, 255, 255, 200))
    
    # 5. Title
    title = movie['title']
    words = title.split()
    lines = []
    current_line = []
    for word in words:
        test_line = ' '.join(current_line + [word])
        try:
            bbox = draw.textbbox((0, 0), test_line, font=font_title)
            w = bbox[2] - bbox[0]
        except:
            w = len(test_line) * 16
        if w > width - 50 and current_line:
            lines.append(' '.join(current_line))
            current_line = [word]
        else:
            current_line.append(word)
    if current_line:
        lines.append(' '.join(current_line))
    
    title_y = div_y + 24
    for line in lines[:3]:
        # Drop shadow
        draw.text((width//2 + 1, title_y + 1), line, font=font_title, fill=(0, 0, 0, 220), anchor='mt')
        draw.text((width//2, title_y), line, font=font_title, fill=(255, 255, 255), anchor='mt')
        title_y += 34
    
    # 6. Year and Genre
    year_str = str(movie.get('year', ''))
    genre_str = movie.get('genre', '').split(',')[0].strip()
    sub_text = f"{year_str}  •  {genre_str}" if genre_str else year_str
    draw.text((width//2, title_y + 6), sub_text, font=font_year, fill=(186, 215, 248), anchor='mt')
    
    # 7. SciFiLens watermark and cinematic border
    draw.text((width//2, height - 22), "S C I F I L E N S", font=font_brand, fill=(255, 255, 255, 130), anchor='mb')
    
    # Double border
    draw.rectangle([3, 3, width - 4, height - 4], outline=(255, 255, 255, 50), width=1)
    draw.rectangle([8, 8, width - 9, height - 9], outline=(255, 255, 255, 25), width=1)
    
    img.save(output_path, 'JPEG', quality=92)
    print(f"Generated: {os.path.basename(output_path)}")

def main():
    with open('data/movies.json', 'r', encoding='utf-8') as f:
        movies = json.load(f)['movies']
    
    os.makedirs('images/posters', exist_ok=True)
    
    target_ids = [88, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112]
    
    for m in movies:
        if m['id'] in target_ids:
            purl = m.get('posterUrl')
            if purl:
                create_poster(m, purl)

if __name__ == '__main__':
    main()
