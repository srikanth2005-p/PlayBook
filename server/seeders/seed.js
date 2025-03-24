require('dotenv').config();
const mongoose = require('mongoose');
const Owner = require('../models/Owner');
const User = require('../models/User');

const owners = [
    {
        fullName: 'John Smith',
        email: 'john1@example.com',
        phone: '9876543210',
        password: 'test123',
        businessName: 'Sports Arena Pro',
        venueType: 'cricket',
        address: '123 Sports Complex, Main Street, Hyderabad - 500001',
        status: 'approved',
        isVerified: true
    },
    {
        fullName: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '9876543211',
        password: 'test123',
        businessName: 'Wilson Sports Hub',
        venueType: 'football',
        address: '456 Wilson Avenue, Sports District, Hyderabad - 500002',
        status: 'approved',
        isVerified: true
    },
    {
        fullName: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '9876543212',
        password: 'test123',
        businessName: 'Johnson Tennis Academy',
        venueType: 'tennis',
        address: '789 Tennis Court Lane, Hyderabad - 500003',
        status: 'approved',
        isVerified: true
    },
    {
        fullName: 'David Kumar',
        email: 'david@example.com',
        phone: '9876543213',
        password: 'test123',
        businessName: 'Kumar Sports Center',
        venueType: 'badminton',
        address: '101 Sports Hub, Jubilee Hills, Hyderabad - 500004',
        status: 'approved',
        isVerified: true
    }
];

const users = [
    {
        fullName: 'Test User',
        email: 'test@test.com',
        phone: '9876543214',
        password: 'test123',
        interests: ['cricket', 'football'],
        isVerified: true
    },
    {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543218',
        password: 'test123',
        interests: ['cricket', 'tennis'],
        isVerified: true
    },
    {
        fullName: 'Raj Kumar',
        email: 'raj@example.com',
        phone: '9876543215',
        password: 'test123',
        interests: ['cricket', 'tennis'],
        isVerified: true
    },
    {
        fullName: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876543216',
        password: 'test123',
        interests: ['badminton', 'tennis'],
        isVerified: true
    },
    {
        fullName: 'Alex Thompson',
        email: 'alex@example.com',
        phone: '9876543217',
        password: 'test123',
        interests: ['football', 'basketball'],
        isVerified: true
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Drop existing collections
        await mongoose.connection.dropDatabase();
        console.log('Dropped existing database');

        // Create owners
        for (const owner of owners) {
            await Owner.create(owner);
        }
        console.log('Owners created successfully');

        // Create users
        for (const user of users) {
            await User.create(user);
        }
        console.log('Users created successfully');

        // Log the counts
        const ownerCount = await Owner.countDocuments();
        const userCount = await User.countDocuments();
        console.log(`Inserted ${ownerCount} owners and ${userCount} users`);

        console.log('\nTest Credentials:');
        console.log('User Login - Email: test@test.com, Password: test123');
        console.log('Owner Login - Email: john1@example.com, Password: test123');

        // Close the connection
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Run the seeder
seedDatabase();
