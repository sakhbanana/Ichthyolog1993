'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';

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
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Имя должно состоять не менее чем из 2 символов.',
  }),
  email: z.string().email({
    message: 'Пожалуйста, введите действительный адрес электронной почты.',
  }),
  password: z.string().min(8, {
    message: 'Пароль должен состоять не менее чем из 8 символов.',
  }),
});

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        
        await sendEmailVerification(user);

        const userDocRef = doc(firestore, 'users', user.uid);
        
        const userAvatars = PlaceHolderImages.filter(img => img.id.startsWith('user'));
        const randomAvatar = userAvatars[Math.floor(Math.random() * userAvatars.length)];

        setDocumentNonBlocking(userDocRef, {
          id: user.uid,
          name: values.name,
          email: values.email,
          avatar: randomAvatar.imageUrl,
          online: true, 
          registrationDate: serverTimestamp(),
        }, { merge: true });

        toast({
          title: 'Аккаунт почти готов!',
          description: 'Мы отправили письмо для подтверждения на вашу почту.',
        });
        router.push('/login');
      })
      .catch((error: any) => {
        console.error(error);
        let description = 'Произошла ошибка при регистрации. Попробуйте снова.';
        if (error.code === 'auth/email-already-in-use') {
          description = 'Этот адрес электронной почты уже используется.';
        }
        toast({
          variant: 'destructive',
          title: 'Ошибка регистрации',
          description,
        });
      });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <CardTitle className="text-2xl font-headline">Создать аккаунт</CardTitle>
        <CardDescription>Присоединяйтесь к чату, введя свои данные.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Ваше Имя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              {form.formState.isSubmitting ? 'Создание...' : 'Создать аккаунт'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Войти
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
