// ===================================================
// BIBLIOTECA DE EXERCÍCIOS PRONTOS
// ===================================================
// Lista fixa que vem com o app. Pra adicionar mais exercícios,
// é só seguir o mesmo formato: [nome, séries, reps]

const BIBLIOTECA = [
  {
    categoria: 'Peito',
    exercicios: [
      ['Supino reto com barra', '3-4', '8-12'],
      ['Supino inclinado com barra', '3-4', '8-12'],
      ['Supino reto com halteres', '3-4', '8-12'],
      ['Supino inclinado com halteres', '3-4', '8-12'],
      ['Supino declinado', '3', '8-12'],
      ['Crucifixo com halteres', '3', '10-12'],
      ['Crucifixo na máquina (peck deck)', '3', '10-15'],
      ['Crossover no cabo', '3', '12-15'],
      ['Chest press na máquina', '3', '10-12']
    ]
  },
  {
    categoria: 'Costas',
    exercicios: [
      ['Puxada frontal (pulldown)', '3-4', '8-12'],
      ['Puxada com triângulo', '3', '10-12'],
      ['Remada curvada com barra', '3-4', '8-12'],
      ['Remada unilateral com halter (serrote)', '3', '10-12'],
      ['Remada baixa no cabo', '3', '10-12'],
      ['Remada cavalinho (T-bar)', '3', '8-12'],
      ['Pulldown com braço estendido', '3', '12-15'],
      ['Levantamento terra', '3-4', '5-8']
    ]
  },
  {
    categoria: 'Pernas',
    exercicios: [
      ['Agachamento livre', '3-4', '6-10'],
      ['Agachamento no Smith', '3-4', '8-12'],
      ['Leg press 45°', '3-4', '10-12'],
      ['Hack squat', '3', '8-12'],
      ['Cadeira extensora', '3', '12-15'],
      ['Mesa flexora', '3', '10-12'],
      ['Cadeira flexora', '3', '10-12'],
      ['Stiff', '3', '8-12'],
      ['Afundo / passada', '3', '10-12'],
      ['Agachamento búlgaro', '3', '8-12'],
      ['Elevação pélvica (hip thrust)', '3-4', '8-12'],
      ['Cadeira abdutora', '3', '12-15'],
      ['Cadeira adutora', '3', '12-15'],
      ['Panturrilha em pé', '4', '12-15'],
      ['Panturrilha sentado', '4', '12-15']
    ]
  },
  {
    categoria: 'Ombros',
    exercicios: [
      ['Desenvolvimento com halteres', '3-4', '8-12'],
      ['Desenvolvimento com barra', '3-4', '6-10'],
      ['Desenvolvimento na máquina', '3', '10-12'],
      ['Elevação lateral', '3-4', '12-15'],
      ['Elevação lateral no cabo', '3', '12-15'],
      ['Elevação frontal', '3', '10-12'],
      ['Crucifixo inverso', '3', '12-15'],
      ['Face pull', '3', '12-15'],
      ['Encolhimento com halteres', '3', '10-15']
    ]
  },
  {
    categoria: 'Bíceps',
    exercicios: [
      ['Rosca direta com barra', '3', '8-12'],
      ['Rosca alternada com halteres', '3', '10-12'],
      ['Rosca martelo', '3', '10-12'],
      ['Rosca Scott', '3', '10-12'],
      ['Rosca concentrada', '3', '10-12'],
      ['Rosca no cabo', '3', '12-15']
    ]
  },
  {
    categoria: 'Tríceps',
    exercicios: [
      ['Tríceps na polia (barra)', '3', '10-12'],
      ['Tríceps corda', '3', '10-15'],
      ['Tríceps testa', '3', '8-12'],
      ['Tríceps francês', '3', '10-12'],
      ['Tríceps coice', '3', '12-15'],
      ['Supino fechado', '3', '8-10']
    ]
  },
  {
    categoria: 'Abdômen',
    exercicios: [
      ['Abdominal supra (crunch)', '3', '15-20'],
      ['Abdominal infra', '3', '12-15'],
      ['Abdominal na polia', '3', '12-15'],
      ['Elevação de pernas na barra', '3', '10-15'],
      ['Prancha', '3', '30-60s'],
      ['Prancha lateral', '3', '30s'],
      ['Abdominal bicicleta', '3', '20']
    ]
  },
  {
    categoria: 'Calistenia',
    exercicios: [
      ['Flexão de braço', '3-4', '10-20'],
      ['Flexão diamante', '3', '8-15'],
      ['Flexão declinada (pés elevados)', '3', '8-15'],
      ['Flexão pike', '3', '8-12'],
      ['Barra fixa (pull-up)', '3-4', '5-10'],
      ['Barra fixa supinada (chin-up)', '3-4', '5-10'],
      ['Barra australiana', '3', '8-12'],
      ['Mergulho nas paralelas (dips)', '3-4', '8-12'],
      ['Mergulho no banco', '3', '10-15'],
      ['Agachamento livre (peso do corpo)', '3', '15-25'],
      ['Agachamento pistol', '3', '5-8'],
      ['Agachamento com salto', '3', '10-15'],
      ['Burpee', '3', '10-15'],
      ['Hollow body hold', '3', '20-40s'],
      ['L-sit', '3', '10-20s'],
      ['Muscle-up', '3', '3-5'],
      ['Parada de mão na parede', '3', '20-40s']
    ]
  }
];
