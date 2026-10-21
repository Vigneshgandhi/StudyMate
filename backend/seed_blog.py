from database import get_db, init_db
from blog_service import save_post

init_db()
conn = get_db()
try:
    exists = conn.execute("SELECT id FROM blog_posts WHERE slug = ?", ("understanding-convolutional-neural-networks",)).fetchone()
finally:
    conn.close()

if not exists:
    save_post({
        "title": "Understanding Convolutional Neural Networks",
        "slug": "understanding-convolutional-neural-networks",
        "category": "AI & Machine Learning",
        "excerpt": "A practical introduction to CNN architecture, feature extraction, and medical imaging.",
        "content": """# Understanding Convolutional Neural Networks\n\nConvolutional neural networks (CNNs) learn visual patterns by applying small filters across an input.\n\n## The core idea\n\nConvolution layers detect local features such as edges and textures. Pooling reduces spatial size while preserving important signals. Dense layers combine those signals into a prediction.\n\n## A real-world example\n\nIn medical imaging, a CNN can learn patterns in X-ray scans that help clinicians identify regions that need closer review. The model supports decisions; it does not replace clinical judgment.\n\n## What to study next\n\nCompare convolution, pooling, and dense layers, then practise tracing the shape of a tensor through a small network.\n""",
        "author": "StudyMate Team",
        "status": "published",
    })
    print("Seeded sample blog article.")
else:
    print("Sample blog article already exists.")
