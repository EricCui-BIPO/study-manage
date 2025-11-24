import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  const email = 'admin@example.com'
  const password = 'password123'

  console.log(`Creating user ${email}...`)

  // Check if user exists
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError)
    return
  }

  const existingUser = users.users.find(u => u.email === email)

  if (existingUser) {
    console.log('User already exists. Updating password...')
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: password, email_confirm: true }
    )
    if (updateError) {
      console.error('Error updating user:', updateError)
    } else {
      console.log('User updated successfully!')
      console.log('Email:', email)
      console.log('Password:', password)
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: 'Admin'
      }
    })

    if (error) {
      console.error('Error creating user:', error)
    } else {
      console.log('User created successfully!')
      console.log('Email:', email)
      console.log('Password:', password)
    }
  }
}

createAdmin()
