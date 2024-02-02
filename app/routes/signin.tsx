import { Button, Input } from '@nextui-org/react';
import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { prisma } from '~/prisma.server';
import { userSessionStorage } from '~/session.server';

export const action = async (c: ActionFunctionArgs) => {
  const formData = await c.request.formData();

  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user || user.password !== password) {
    return json({
      success: false,
      errors: {
        username: '用户名密码不正确',
      },
    });
  }

  const session = await userSessionStorage.getSession(
    c.request.headers.get('Cookie')
  );
  session.set('username', username);

  return redirect('/', {
    headers: {
      'Set-Cookie': await userSessionStorage.commitSession(session),
    },
  });
};

export default function Page() {
  return (
    <Form method="POST">
      <div className="p-12 flex flex-col gap-3">
        <Input label="用户名" name="username" />
        <Input type="password" label="密码" name="password" />
        <Button type="submit" color="primary">
          登录
        </Button>
      </div>
    </Form>
  );
}
