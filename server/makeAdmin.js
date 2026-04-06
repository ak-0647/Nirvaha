import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    const username = 'nirvaha';
    const password = encodeURIComponent('@nirvahakitapri@2225');
    const shards = 'ac-irglgm3-shard-00-00.oxg7gn5.mongodb.net:27017,ac-irglgm3-shard-00-01.oxg7gn5.mongodb.net:27017,ac-irglgm3-shard-00-02.oxg7gn5.mongodb.net:27017';
    const replicaSet = 'atlas-9bkjvd-shard-0';
    const dbName = 'nirvaha';
    const uri = `mongodb://${username}:${password}@${shards}/${dbName}?ssl=true&replicaSet=${replicaSet}&authSource=admin&appName=Cluster0`;

    await mongoose.connect(uri);
    console.log('DB Connected');
    const adminUser = await User.findOneAndUpdate(
      { email: 'nirvahawaves@gmail.com' }, 
      { role: 'admin' }, 
      { new: true }
    );
    if(adminUser) {
      console.log('Successfully upgraded user to admin:', adminUser.email);
    } else {
      console.log('User not found.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

makeAdmin();
