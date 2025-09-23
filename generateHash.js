const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'Soaib1002'; // the password you want
  const hash = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hash);
}

generateHash();
