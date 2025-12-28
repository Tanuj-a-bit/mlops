
import bcrypt from 'bcryptjs'

const hash = '$2b$10$3/3knXU1006f.TVq4M9r6.Iv/l/TjgACug3DpirDaBwcR08i4.Bra'
const commonPasswords = ['password', 'password123', 'admin', 'admin123', '123456', '12345678', 'qwerty', 'shopmlops']

async function check() {
    for (const pw of commonPasswords) {
        if (await bcrypt.compare(pw, hash)) {
            console.log(`FOUND: ${pw}`)
            return
        }
    }
    console.log('NOT FOUND')
}

check()
