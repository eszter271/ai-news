import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const isMobile = useAppStore((s) => s.isMobile);
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = isMobile
    ? {
        height: '100%',
        background: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }
    : {
        height: '100%',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflow: 'auto',
      };

  return (
    <main data-viewport-mode="app-shell" style={containerStyle}>
      <div
        className="flex flex-col items-center rounded-lg w-full anim-fade-in-up"
        style={{
          maxWidth: 360,
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          padding: 32,
        }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 40,
            height: 40,
            marginBottom: 16,
            background: 'var(--color-primary)',
            color: 'var(--color-primary-foreground)',
            borderRadius: 'var(--radius)',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          AI
        </div>
        <h1
          className="text-center"
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--color-card-foreground)',
            lineHeight: 1.4,
            marginBottom: 4,
          }}
        >
          登录 AI News
        </h1>
        <p
          className="text-center"
          style={{
            fontSize: 13,
            color: 'var(--color-muted-foreground)',
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          登录后可同步收藏和设置
        </p>

        <form
          className="flex flex-col w-full"
          style={{ gap: 12 }}
          onSubmit={onSubmit}
        >
          <div className="flex flex-col" style={{ gap: 4 }}>
            <label
              htmlFor="login-email"
              style={{ fontSize: 13, color: 'var(--color-card-foreground)' }}
            >
              邮箱
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="请输入邮箱地址"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg w-full outline-none focus-visible:ring-2 focus-visible:outline-none"
              style={{
                height: 40,
                padding: '0 12px',
                border: '1px solid var(--color-input)',
                background: 'var(--color-card)',
                color: 'var(--color-card-foreground)',
                fontSize: 13,
              }}
            />
          </div>
          <div className="flex flex-col" style={{ gap: 4 }}>
            <label
              htmlFor="login-password"
              style={{ fontSize: 13, color: 'var(--color-card-foreground)' }}
            >
              密码
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="请输入密码"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg w-full outline-none focus-visible:ring-2 focus-visible:outline-none"
              style={{
                height: 40,
                padding: '0 12px',
                border: '1px solid var(--color-input)',
                background: 'var(--color-card)',
                color: 'var(--color-card-foreground)',
                fontSize: 13,
              }}
            />
          </div>

          {error && (
            <p
              className="text-[12px]"
              style={{ color: 'var(--color-destructive)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full rounded-lg whitespace-nowrap cursor-pointer hover:opacity-90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60"
            style={{
              height: 40,
              marginTop: 4,
              background: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
            }}
          >
            {loading ? '登录中…' : '登录'}
          </button>
        </form>

        <div
          className="flex flex-col items-center"
          style={{ marginTop: 24, gap: 8 }}
        >
          <Link
            to="/register"
            className="whitespace-nowrap hover:underline"
            style={{
              fontSize: 13,
              color: 'var(--color-muted-foreground)',
              textDecoration: 'none',
            }}
          >
            没有账号？注册
          </Link>
          <Link
            to="/"
            className="whitespace-nowrap hover:underline"
            style={{
              fontSize: 13,
              color: 'var(--color-muted-foreground)',
              textDecoration: 'none',
            }}
          >
            返回
          </Link>
        </div>
      </div>
    </main>
  );
}
