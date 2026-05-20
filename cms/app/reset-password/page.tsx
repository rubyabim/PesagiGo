import { redirect } from 'next/navigation';

export default function ResetPasswordRoutePage() {
  redirect('/?mode=reset');
}
