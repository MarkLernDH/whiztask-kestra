from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder_image(text, output_path, width=800, height=600):
    # Create a new image with a light gray background
    image = Image.new('RGB', (width, height), '#f5f5f5')
    draw = ImageDraw.Draw(image)
    
    # Draw a simple pattern
    for i in range(0, width, 30):
        draw.line([(i, 0), (i, height)], fill='#e0e0e0', width=1)
    for i in range(0, height, 30):
        draw.line([(0, i), (width, i)], fill='#e0e0e0', width=1)
    
    # Add text
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 40)
    except:
        font = ImageFont.load_default()
    
    # Get text size and center it
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Draw text with a light background
    padding = 20
    draw.rectangle([
        (x - padding, y - padding),
        (x + text_width + padding, y + text_height + padding)
    ], fill='#ffffff', outline='#e0e0e0')
    
    draw.text((x, y), text, fill='#333333', font=font)
    
    # Save the image
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    image.save(output_path, 'JPEG', quality=90)

# Create placeholder images
images = [
    ('Customer Support', 'customer-support.jpg'),
    ('Sales Pipeline', 'sales-pipeline.jpg'),
    ('Social Media', 'social-media.jpg'),
    ('Invoice', 'invoice.jpg'),
]

for text, filename in images:
    output_path = f'public/images/automations/{filename}'
    create_placeholder_image(text, output_path)
    print(f'Created {output_path}')
