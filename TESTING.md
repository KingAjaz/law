# Testing Guide

This document outlines the testing strategy and how to run tests for LegalEase.

## Testing Strategy

Due to the complexity of setting up end-to-end integration tests with Supabase and Paystack, we recommend the following testing approach:

### 1. Manual Testing

For critical flows, manual testing is recommended:

- **Payment Flow**: Test with Paystack test keys
- **Contract Upload**: Test file upload, validation, and storage
- **KYC Submission**: Test form submission and file upload
- **Authentication**: Test signup, login, password reset, email verification

### 2. API Route Testing

API routes can be tested using tools like:
- Postman/Insomnia for API testing
- curl commands
- Browser DevTools Network tab

### 3. Component Testing (Future)

For React component testing, consider:
- **Jest + React Testing Library** for unit tests
- **Playwright** for E2E tests

## Manual Testing Checklists

### Payment Flow Testing

1. **Contract Upload & Payment Initialization:**
   - [ ] Upload a contract file (PDF/DOCX)
   - [ ] Select a pricing tier
   - [ ] Verify payment initialization redirects to Paystack
   - [ ] Complete payment with test card
   - [ ] Verify payment confirmation email is sent (check console/logs)
   - [ ] Verify contract status updates to "payment_confirmed"

2. **Payment Verification:**
   - [ ] Test payment verification endpoint: `/api/paystack/verify?reference=test_ref`
   - [ ] Verify error handling for invalid references
   - [ ] Test network error scenarios

3. **Webhook Testing:**
   - [ ] Use Paystack test webhook tool
   - [ ] Send `charge.success` event
   - [ ] Verify contract and payment status are updated
   - [ ] Verify payment confirmation email is triggered

### Contract Upload Testing

1. **File Validation:**
   - [ ] Test valid file types (PDF, DOCX)
   - [ ] Test invalid file types (should be rejected)
   - [ ] Test file size limits (should reject files > 10MB)
   - [ ] Test file name validation

2. **Upload Process:**
   - [ ] Upload contract successfully
   - [ ] Verify file is stored in Supabase Storage
   - [ ] Verify contract record is created in database
   - [ ] Test error handling for upload failures

3. **Contract Management:**
   - [ ] View contracts list in dashboard
   - [ ] Download contract file
   - [ ] Delete contract (verify file cleanup)
   - [ ] Test contract deletion modal

### KYC Submission Testing

1. **Form Validation:**
   - [ ] Test required field validation
   - [ ] Test phone number format
   - [ ] Test ID number validation
   - [ ] Test terms acceptance requirement

2. **File Upload:**
   - [ ] Upload valid ID document (PDF, PNG, JPG)
   - [ ] Test invalid file types
   - [ ] Test file size limits (should reject files > 5MB)
   - [ ] Verify file is stored in Supabase Storage

3. **Submission:**
   - [ ] Submit KYC form successfully
   - [ ] Verify KYC record is created with status "pending"
   - [ ] Verify admin can view submission
   - [ ] Test admin approval workflow
   - [ ] Test admin rejection workflow (with reason)

### Authentication Flow Testing

1. **Signup:**
   - [ ] Sign up with email/password
   - [ ] Verify email confirmation is sent
   - [ ] Test password requirements
   - [ ] Test duplicate email handling

2. **Login:**
   - [ ] Login with email/password
   - [ ] Test invalid credentials
   - [ ] Test magic link login
   - [ ] Test OAuth login (Google, GitHub)

3. **Password Reset:**
   - [ ] Request password reset
   - [ ] Verify reset email is sent
   - [ ] Complete password reset flow
   - [ ] Test reset token expiration

4. **Email Verification:**
   - [ ] Verify email after signup
   - [ ] Test verification link expiration
   - [ ] Test resend verification email

## API Testing Examples

### Payment Verification API

```bash
# Test payment verification (replace with actual reference)
curl "https://yourdomain.com/api/paystack/verify?reference=test_ref_123" \
  -H "Content-Type: application/json"
```

### Contact Form API

```bash
# Test contact form submission
curl -X POST "https://yourdomain.com/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message",
    "company": "Test Company"
  }'
```

### Contract Assignment API (Admin)

```bash
# Test contract assignment (requires admin auth)
curl -X POST "https://yourdomain.com/api/contracts/assign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contractId": "contract-uuid",
    "lawyerId": "lawyer-uuid"
  }'
```

### KYC Verification API (Admin)

```bash
# Test KYC approval (requires admin auth)
curl -X POST "https://yourdomain.com/api/kyc/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user-uuid",
    "action": "approve"
  }'

# Test KYC rejection
curl -X POST "https://yourdomain.com/api/kyc/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user-uuid",
    "action": "reject",
    "reason": "Invalid ID document"
  }'
```

## Testing Tools & Setup

### Recommended Tools

1. **Postman** - API testing and documentation
2. **Browser DevTools** - Network monitoring, console inspection
3. **Paystack Dashboard** - Test payments, webhook testing
4. **Supabase Dashboard** - Database inspection, log viewing

### Test Data

For testing, use:
- **Paystack Test Keys**: Use test public/secret keys from Paystack dashboard
- **Test Cards**: Paystack provides test card numbers (e.g., `4084084084084081`)
- **Test Accounts**: Create test user accounts in Supabase
- **Test Files**: Use sample PDF/DOCX files for upload testing

### Environment Setup

For testing, use a separate Supabase project or test environment:
- Create a test Supabase project
- Use test Paystack keys
- Set up test email service (console logging is fine for testing)

## Error Scenarios to Test

### Payment Errors
- Invalid payment reference
- Network failures during payment verification
- Paystack API errors
- Webhook signature validation failures

### File Upload Errors
- File too large
- Invalid file type
- Storage quota exceeded
- Network failures during upload

### Authentication Errors
- Invalid credentials
- Expired tokens
- Email already exists
- Weak passwords

### Database Errors
- Connection failures
- RLS policy violations
- Constraint violations
- Missing required fields

## Performance Testing

1. **Load Testing:**
   - Test with multiple concurrent users
   - Test file upload performance
   - Test database query performance

2. **Stress Testing:**
   - Test rate limiting (429 errors)
   - Test large file uploads
   - Test database with large datasets

## Security Testing

1. **Authentication:**
   - Test unauthorized access attempts
   - Test role-based access control
   - Test session management

2. **Input Validation:**
   - Test SQL injection attempts
   - Test XSS attempts
   - Test file upload security

3. **API Security:**
   - Test rate limiting
   - Test webhook signature validation
   - Test CORS configuration

## Notes

- All API routes have rate limiting implemented
- File uploads have strict validation (type, size, name)
- Authentication uses Supabase Auth with RLS policies
- Payments use Paystack with webhook signature verification
- Error handling is implemented throughout the application
- Logging is structured for debugging and monitoring

For production, consider implementing automated tests using:
- Jest for unit tests
- Playwright or Cypress for E2E tests
- Supertest for API route testing
