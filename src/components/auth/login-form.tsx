'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({
    message: 'Пожалуйста, введите действительный адрес электронной почты.',
  }),
  password: z.string().min(8, {
    message: 'Пароль должен состоять не менее чем из 8 символов.',
  }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        toast({
            variant: 'destructive',
            title: 'Email не подтвержден',
            description: 'Пожалуйста, проверьте свою почту и перейдите по ссылке для подтверждения.',
        });
        return;
      }

      toast({
        title: 'Вход выполнен успешно',
        description: 'С возвращением!',
      });
      router.push('/chat');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ошибка входа',
        description: 'Неверный email или пароль. Попробуйте снова.',
      });
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <CardTitle className="text-2xl font-headline">С возвращением!</CardTitle>
        <CardDescription>Введите свои учетные данные для доступа к чату.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Электронная почта</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full !mt-6 bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
