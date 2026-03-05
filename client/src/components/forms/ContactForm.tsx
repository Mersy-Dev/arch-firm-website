import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useSubmitContactMutation } from '@/services/contactApi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Please enter a valid email'),
  phone:   z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function ContactForm() {
  const [submit, { isLoading }] = useSubmitContactMutation();
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await submit(data).unwrap();
      toast.success("Message sent — we'll be in touch within 2 business days.");
      reset();
    } catch { toast.error('Something went wrong. Please try again.'); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <div className="grid sm:grid-cols-2 gap-6">
        <Input label="Full Name"  error={errors.name?.message}  {...register('name')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      </div>
      <Input label="Message" as="textarea" rows={5} error={errors.message?.message} {...register('message')} />
      <Button type="submit" size="lg" loading={isLoading} className="w-full">Send Enquiry</Button>
    </form>
  );
}