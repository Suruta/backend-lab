require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

async function main() {
	const email = process.argv[2];
	const newPassword = process.argv[3];
	if (!email || !newPassword) {
		console.log('Usage: node scripts/set-password.js <email> <newPassword>');
		process.exit(1);
	}

	const passwordHash = await bcrypt.hash(newPassword, 10);

	const user = await prisma.user.update({
		where: {email},
		data: {passwordHash},
		select: {id: true, email: true, role: true}
	});
	console.log('Password updated for:', user);
}

main()
.catch(console.error)
.finally(() => prisma.$disconnect());