import Link from "next/link";

const TopBar = () => {
    return (
        <nav className="flex gap-4 flex-wrap p-6 bg-blue-200 justify-between">
            <h2>Gestión COP</h2>
            <Link href="/" className="text-blue-600 hover:underline">Cerrar Sesion</Link>
        </nav>
    );
}

export default TopBar;
