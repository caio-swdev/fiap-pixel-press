# Journal — Atividade 2: MVP com Agentes de IA

---

## 2026-06-11

### Velocidade: Claude Code vs Lovable

O Claude Code é consideravelmente mais lento que o Lovable. Possíveis razões: o Lovable é otimizado para prototipagem, enquanto o Claude Code é uma ferramenta de propósito geral. Além disso, parte da execução roda na máquina local, gerando bastante round-trip entre cliente e servidor.

---

### Contaminação de contexto por referências

Informações fornecidas como referência podem acabar sendo incluídas no resultado final. Por exemplo: a stack do projeto é TypeScript, mas prompts gerados pelo agente incluíam referências a Java. A correção exigiu prompts adicionais pedindo revisão explícita.

---

### Bônus: landing page com Claude Design

Com o sistema pronto, adicionamos uma landing page como bônus. Utilizamos o Claude Design para gerar um protótipo, foram geradas 2 versões, escolhemos uma e exportamos o mock HTML como referência para o Claude Code implementar.
