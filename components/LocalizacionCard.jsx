import { useState } from "react";
import { Card, CardBody, CardFooter, Chip, Image, Button } from "@heroui/react";
import { useRouter } from 'next/navigation';

const CARD_WIDTH = "w-80";
const IMAGE_HEIGHT = "h-[240px] md:h-[260px] xl:h-[280px]";

const LocalizacionCard = ({ localizacion }) => {
  const [showInfo, setShowInfo] = useState(false);
  const router = useRouter();

  return (
    <>
      <Card className={`${CARD_WIDTH} min-h-[420px] max-h-[440px] flex flex-col justify-between`}>
        <CardBody className="overflow-visible p-0 h-fit">
          <div className={`w-full ${IMAGE_HEIGHT} flex items-center justify-center bg-gray-50 rounded-t-lg`}>
            <Image
              className={`object-cover w-full ${IMAGE_HEIGHT}`}
              //src={product.image}
              //alt={product.name}
              src={"/next.svg"}
              alt={localizacion.nombre}
              shadow="sm"
              radius="sm"
              isZoomed
            />
          </div>
          <div className="flex flex-col gap-1 p-4">
            <h2 className="font-bold text-xl line-clamp-1">{localizacion.nombre}</h2>
            <h3 className="text-sm text-gray-500">160 Policias Asignados</h3>
          </div>
        </CardBody>
        <CardFooter className="flex flex-col gap-3 p-4">
          <Button
            color="primary"
            className="w-full py-4 text-lg font-semibold rounded-lg flex justify-center items-center"
            radius="sm"
            size="md"
            onPress={() => router.push(`/localizacion/${localizacion.id}`)}
          >
            Ver Ubicación
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default LocalizacionCard;