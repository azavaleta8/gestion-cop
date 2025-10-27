import Link from "next/link";

const Sidebar = () => {
    return (
        <nav className="flex flex-col gap-4 flex-wrap">
            <Link href="/home/perfil" className="text-blue-600 hover:underline text-left">
                Perfil
            </Link>
            <Link href="/home/localizaciones" className="text-blue-600 hover:underline text-left">
                Localizaciones
            </Link>
            <Link href="/home/trabajadores" className="text-blue-600 hover:underline text-left">
                Trabajadores
            </Link>
            <Link href="/guardias" className="text-blue-600 hover:underline text-left">
                Gestión de Guardias
            </Link>
            <Link href="/home/horarios" className="text-blue-600 hover:underline text-left">
                Horarios
            </Link>
            <Link href="/home/documentos" className="text-blue-600 hover:underline text-left">
                Documentos
            </Link>
            <Link href="/configuracion/roles" className="text-blue-600 hover:underline text-left">
                Gestión de Roles
            </Link>
            <Link href="/home/configuracion" className="text-blue-600 hover:underline text-left">
                Configuración
            </Link>
        </nav>
    );
};

export default Sidebar;