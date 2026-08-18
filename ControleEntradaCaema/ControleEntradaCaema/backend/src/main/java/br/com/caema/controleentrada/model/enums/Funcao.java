package br.com.caema.controleentrada.model.enums;

public enum Funcao {
    CMD_DA_GUARDA("Cmd da Guarda"),
    GUARDA("Guarda"),
    PATRULHEIRO("Patrulheiro"),
    MOTORISTA("Motorista"),
    CMD_DE_VTR("Cmd de VTR");

    private final String descricao;

    Funcao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
