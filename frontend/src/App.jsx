import Sidebar from "./components/Sidebar.jsx";

function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink">
      <Sidebar />
      <div className="flex-1 p-8 text-parchment">
        Main content area — pages go here next.
      </div>
    </div>
  );
}

export default App;