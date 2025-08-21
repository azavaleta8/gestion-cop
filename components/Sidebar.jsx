import Link from "next/link";

const Sidebar = () => {
    return (
        <nav className="flex flex-col gap-4 flex-wrap">
            <Link href="/home" className="text-blue-600 hover:underline">Horarios</Link>
            <Link href="/home" className="text-blue-600 hover:underline">Documentos</Link>
            <Link href="/home" className="text-blue-600 hover:underline">Configuración</Link>
        </nav>
    );
}

export default Sidebar;