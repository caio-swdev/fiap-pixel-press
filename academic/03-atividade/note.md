Aplicar técnicas de "Modernização de Sistemas" no projeto desenvolvido nas aulas anteriores. O aluno deve identificar dívidas técnicas geradas (inclusive pela própria IA) e realizar uma refatoração estruturada.

O Desafio

Você deve realizar uma Auditoria Técnica no sistema que você implementou (baseado na arquitetura da Aula 1). O foco não é adicionar novas funcionalidades, mas garantir que o sistema seja sustentável, seguro e moderno.

Entregáveis:

1- Código Refatorado: No seu repositório GitHub (branch refactoring).

2- Relatório de Modernização: Um arquivo PDF ou Markdown.

Diagnóstico de Dívida Técnica (sugestão)

O aluno deve usar um agente de IA para escanear o projeto e listar:

- Code Smells: (Ex: Métodos muito longos, classes com responsabilidades múltiplas).

- Violação de Padrões: (Ex: Lógica de banco de dados dentro do Controller).

- Obsolescência: (Ex: Uso de loops manuais onde caberia Java Streams).

Dica de Prompt: "Aja como um Arquiteto de Software. Analise meu projeto e gere um relatório de dívida técnica, focando em violações de SOLID [e princípios x, y... z] e acoplamento excessivo."

Obs.: Documente os prompts de refatoração utilizados.
