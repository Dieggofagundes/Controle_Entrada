package br.com.caema.controleentrada.model.enums;

public enum Funcao {
    CMD_DA_GUARDA("Cmd da Guarda"),
    GUARDA("Guarda"),
    PATRULHEIRO("Patrulheiro"),
    MOTORISTA("Motorista"),
    CMD_DE_VTR("Cmd de VTR"),
    CMD_PELOTAO("Cmd Pelotão"),
    CMD_GUARNICAO("Cmd Guarnição"),
    ADMINISTRATIVO("Administrativo"),
    SALA_DE_MEIO("Sala de Meio"),
    SOINT("Soint"),
    ADMIN_SISTEMA("Admin do Sistema");

    private final String descricao;

    Funcao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
