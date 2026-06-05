import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.shop.models import Product, ProductVariant, ProductImage
from apps.users.models import UserProfile

class Command(BaseCommand):
    help = 'Seeds the database with initial users and products'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Seeding data...'))

        # 1. Clear existing data (optional, but good for clean start)
        # Uncomment below if you want to wipe data before seeding
        # User.objects.exclude(is_superuser=True).delete()
        # Product.objects.all().delete()

        # 2. Create Users
        self.stdout.write('Creating users...')
        admin_user, created = User.objects.get_or_create(username='admin', email='admin@example.com')
        if created:
            admin_user.set_password('admin123')
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Superadmin created: admin / admin123'))

        customer_user, created = User.objects.get_or_create(username='customer', email='customer@example.com')
        if created:
            customer_user.set_password('customer123')
            customer_user.save()
            # Give customer some initial points for testing the new feature
            if hasattr(customer_user, 'profile'):
                customer_user.profile.points = 50000
                customer_user.profile.save()
            self.stdout.write(self.style.SUCCESS('Customer created: customer / customer123 (with 50,000 points)'))

        # 3. Create Products
        self.stdout.write('Creating products...')
        sneakers_data = [
            {
                'name': 'Nike Air Jordan 1 Retro High',
                'description': 'The Air Jordan 1 Retro High is a classic sneaker that never goes out of style. Features premium leather and iconic design.',
                'brand': 'Nike',
                'gender': 'Men',
                'base_price': 2500000,
                'colors': ['Chicago Red', 'Bred Toe'],
                'image': 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=80&w=1000&auto=format&fit=crop'
            },
            {
                'name': 'Adidas Ultraboost 1.0',
                'description': 'Experience ultimate comfort with the Adidas Ultraboost. Perfect for running or casual streetwear.',
                'brand': 'Adidas',
                'gender': 'Unisex',
                'base_price': 1800000,
                'colors': ['Core Black', 'Cloud White'],
                'image': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop'
            },
            {
                'name': 'New Balance 550 White Green',
                'description': 'The revival of a retro basketball shoe. The New Balance 550 offers a clean and versatile look.',
                'brand': 'New Balance',
                'gender': 'Men',
                'base_price': 2100000,
                'colors': ['White/Green', 'White/Grey'],
                'image': 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop'
            },
            {
                'name': 'Nike Dunk Low Panda',
                'description': 'The highly sought-after Nike Dunk Low in the classic black and white "Panda" colorway.',
                'brand': 'Nike',
                'gender': 'Women',
                'base_price': 1500000,
                'colors': ['Black/White'],
                'image': 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1000&auto=format&fit=crop'
            }
        ]

        sizes = ['39', '40', '41', '42', '43']

        for data in sneakers_data:
            product, created = Product.objects.get_or_create(
                name=data['name'],
                defaults={
                    'description': data['description'],
                    'brand': data['brand'],
                    'gender': data['gender']
                }
            )

            if created:
                # Add primary image
                ProductImage.objects.create(
                    product=product,
                    image=data['image'],
                    is_primary=True
                )

                # Add variants (Sizes and Colors)
                for color in data['colors']:
                    for size in sizes:
                        # Randomize stock and slight price variations
                        stock = random.randint(5, 50)
                        price_modifier = random.choice([0, 50000, 100000]) if size in ['42', '43'] else 0
                        
                        ProductVariant.objects.create(
                            product=product,
                            size=size,
                            color=color,
                            price=data['base_price'] + price_modifier,
                            stock=stock
                        )
                self.stdout.write(f"  -> Created product: {product.name} with {len(sizes) * len(data['colors'])} variants.")

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
