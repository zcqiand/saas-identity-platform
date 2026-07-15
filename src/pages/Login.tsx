// 登录页占位（ch39）。ch40 在 features/sso 实现真实 SSO 跳转。
export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div data-fn="M01.F04.I04" className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">登录</h2>
        <p className="text-gray-500 text-center text-sm">SSO 登录待 ch40 实现</p>
      </div>
    </div>
  );
}
