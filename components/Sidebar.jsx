/*import Link from "next/link";

const Sidebar = () => {
    return (
        <nav className="flex flex-col gap-4 flex-wrap">
            <Link href="/home" className="text-blue-600 hover:underline">Horarios</Link>
            <Link href="/home" className="text-blue-600 hover:underline">Documentos</Link>
            <Link href="/home" className="text-blue-600 hover:underline">Configuración</Link>
        </nav>
    );
}

export default Sidebar;*/

const Sidebar = ({ onSelect }) => {
  return (
    <nav className="flex flex-col gap-4 flex-wrap">
      <button onClick={() => onSelect("perfil")} className="text-blue-600 hover:underline text-left">
        Perfil
      </button>
      <button onClick={() => onSelect("horarios")} className="text-blue-600 hover:underline text-left">
        Horarios
      </button>
      <button onClick={() => onSelect("documentos")} className="text-blue-600 hover:underline text-left">
        Documentos
      </button>
      <button onClick={() => onSelect("configuracion")} className="text-blue-600 hover:underline text-left">
        Configuración
      </button>
    </nav>
  );
};

export default Sidebar;