import uvicorn
import os
import sys

if __name__ == "__main__":
    project_root = os.path.dirname(os.path.abspath(__file__))
    
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    
    src_path_check = os.path.join(project_root, "src")
    if not os.path.isdir(src_path_check):
        print(f"ERRO: Diretório 'src' não encontrado em '{project_root}'")
        sys.exit(1)
    if not os.path.exists(os.path.join(src_path_check, "__init__.py")):
        print(f"ERRO: Arquivo '__init__.py' não encontrado em '{src_path_check}'")
       


    print(f"--- Iniciando Uvicorn a partir de run.py ---")
    print(f"--- Raiz do Projeto (para app_dir e PYTHONPATH): {project_root} ---")
    print(f"--- sys.path atual ---")
    for p_idx, p_val in enumerate(sys.path):
        print(f"{p_idx}: {p_val}")
    print(f"--- Fim sys.path atual ---")

    uvicorn.run(
        "src.main:app",  
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=[os.path.join(project_root, "src")], 
        app_dir=project_root 
    )