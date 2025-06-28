
const RecommendationCard = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 className="font-medium text-yellow-900 mb-2">Recomendações para Melhor Análise</h4>
      <ul className="text-sm text-yellow-800 space-y-1">
        <li>• Certifique-se de ter pelo menos 2-3 medições por vista para análise completa</li>
        <li>• Use linhas de referência horizontais para avaliar simetrias</li>
        <li>• Aplique medições angulares para quantificar desvios posturais</li>
        <li>• Mantenha calibração precisa informando a altura correta do cliente</li>
      </ul>
    </div>
  );
};

export default RecommendationCard;
