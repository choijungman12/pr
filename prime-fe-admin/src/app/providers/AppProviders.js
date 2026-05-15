import AppStateBootstrap from "./AppStateBootstrap";

// Context가 사라진 뒤에는 AppProviders가 store bootstrap 진입점 역할을 한다.
export default function AppProviders({ children }) {
  return (
    <>
      <AppStateBootstrap />
      {children}
    </>
  );
}
