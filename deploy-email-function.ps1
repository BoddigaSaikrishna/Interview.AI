# Deploy Interview Result Email Function
# Run this script from: c:\Users\bsaik\Desktop\My Project

# Step 1: Login to Supabase CLI (one-time)
npx -y supabase@latest login

# Step 2: Set the Brevo API key as a secret
npx supabase secrets set `
  BREVO_API_KEY=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 `
  EMAIL_FROM_ADDRESS=noreply@interviewai.app `
  APP_URL=https://ukgwpxeqjnbwhxjjdjvn.supabase.co `
  --project-ref ukgwpxeqjnbwhxjjdjvn

# Step 3: Deploy the new edge function
npx supabase functions deploy send-result-email --project-ref ukgwpxeqjnbwhxjjdjvn
