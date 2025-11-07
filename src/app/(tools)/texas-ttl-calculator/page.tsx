import { Calculator } from '../../../components/Calculator'
import { CalculatorProvider } from '../../../providers/CalculatorProvider'

export default function Home() {
  return (
    <CalculatorProvider>
      <Calculator />
    </CalculatorProvider>
  );
}
