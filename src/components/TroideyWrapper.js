import { TroideyProvider } from '@/context/TroideyContext';
import Troidey from '@/components/Troidey';

export default function TroideyWrapper() {
  return (
    <TroideyProvider>
      <Troidey />
    </TroideyProvider>
  );
}
