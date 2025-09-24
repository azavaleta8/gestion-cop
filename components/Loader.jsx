const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
    <img
      src="/spinner.svg"
      alt="Cargando..."
      className="w-24 h-24"
      style={{ pointerEvents: "none" }}
    />
  </div>
);

export default Loader;