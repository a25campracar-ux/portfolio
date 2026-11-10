import { BrowserRouter } from 'react-router';
import { Elevator } from './elevator/Elevator';

export default function App() {
  return (
    <BrowserRouter>
      <Elevator />
    </BrowserRouter>
  );
}
