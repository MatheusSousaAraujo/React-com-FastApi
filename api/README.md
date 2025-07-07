# API-CRUD

## Tecnologias Utilizadas

## 🚀 Como Rodar Este Projeto

Siga os passos abaixo para configurar e executar a aplicação completa em sua máquina local.

1.  **Abra pelo terminal**
    Navegue até a pasta raiz do projeto clonado:
    ```bash
    cd API
    ```

2.  **Crie o ambiente virtual:**
    É recomendado criar o ambiente virtual.
    ```bash
    python -m venv .venv
    ```

3.  **Ative o ambiente virtual:**
    *   No Windows:
        ```bash
        .venv\Scripts\activate
        ```
    *   No macOS/Linux:
        ```bash
        source .venv/bin/activate
        ```
    Você saberá que está ativo pois o nome do ambiente (`.venv`) aparecerá no início do seu prompt do terminal.

4.  **Instale as dependências do backend:**
    Certifique-se de que o arquivo `requirements.txt` está presente na pasta `API`.
    ```bash
    pip install -r requirements.txt
    ```
    *(Opcional, mas recomendado: `python -m pip install --upgrade pip` antes de instalar os requirements)*

5.  **Execute a aplicação**
    Execute o arquivo run.py no terminal no diretório raiz:
    ```bash
    python run.py
    ```
    A api estará rodando, geralmente em `http://localhost:8000`. Mantenha este terminal aberto.
