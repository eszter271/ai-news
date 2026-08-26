import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { api, ApiError } from '../lib/api';
import { formatCountdown } from '../lib/format';

const CODE_COUNTDOWN = 60;

export default function RegisterPage() {
  const navigate = useNavigate();
  const isMobile = useAppStore((s) => s.isMobile);
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(CODE_COUNTDOWN);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const onSendCode = async () => {
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入正确的邮箱');
      return;
    }
    setSendingCode(true);
    try {
      await api.post('/auth/send-code', { email });
      startCountdown();
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 0) {
        setError('后端未启动，验证码功能需要 NestJS 起来后可用');
      } else {
        setError(e?.message || '验证码发送失败');
      }
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !code) {
      setError('请填写邮箱、密码和验证码');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, code);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || '注册失败');
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
          注册 AI News
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
          使用邮箱验证码注册账号
        </p>

        <form
          className="flex flex-col w-full"
          style={{ gap: 12 }}
          onSubmit={onSubmit}
        >
          <div className="flex flex-col" style={{ gap: 4 }}>
            <label
              htmlFor="reg-email"
              style={{ fontSize: 13, color: 'var(--color-card-foreground)' }}
            >
              邮箱
            </label>
            <input
              id="reg-email"
              type="email"
              placeholder="请输入邮箱地址"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg w-full outline-none focus-visible:ring-2"
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
              htmlFor="reg-code"
              style={{ fontSize: 13, color: 'var(--color-card-foreground)' }}
            >
              验证码
            </label>
            <div className="flex items-center gap-2">
              <input
                id="reg-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 位验证码"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="rounded-lg w-full outline-none focus-visible:ring-2"
                style={{
                  height: 40,
                  padding: '0 12px',
                  border: '1px solid var(--color-input)',
                  background: 'var(--color-card)',
                  color: 'var(--color-card-foreground)',
                  fontSize: 13,
                }}
              />
              <button
                type="button"
                onClick={onSendCode}
                disabled={countdown > 0 || sendingCode}
                className="shrink-0 rounded-lg whitespace-nowrap cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  height: 40,
                  padding: '0 12px',
                  background: 'var(--color-secondary)',
                  color: 'var(--color-secondary-foreground)',
                  fontSize: 12,
                  border: '1px solid var(--color-input)',
                }}
              >
                {sendingCode
                  ? '发送中…'
                  : countdown > 0
                    ? formatCountdown(countdown)
                    : '获取验证码'}
              </button>
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: 4 }}>
            <label
              htmlFor="reg-password"
              style={{ fontSize: 13, color: 'var(--color-card-foreground)' }}
            >
              密码
            </label>
            <input
              id="reg-password"
              type="password"
              placeholder="至少 6 位"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg w-full outline-none focus-visible:ring-2"
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
            {loading ? '注册中…' : '注册'}
          </button>
        </form>

        <div
          className="flex flex-col items-center"
          style={{ marginTop: 24, gap: 8 }}
        >
          <Link
            to="/login"
            className="whitespace-nowrap hover:underline"
            style={{
              fontSize: 13,
              color: 'var(--color-muted-foreground)',
              textDecoration: 'none',
            }}
          >
            已有账号？登录
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
