package br.com.caema.controleentrada.dto.auth;

import br.com.caema.controleentrada.model.enums.Funcao;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SolicitarCadastroRequest(
        @NotBlank(message = "Informe a matricula") String matricula,
        @NotBlank(message = "Informe a senha") @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres") String senha,
        @NotBlank(message = "Informe o nome completo") String nomeCompleto,
        @NotBlank(message = "Informe o nome de guerra") String nomeGuerra,
        @Email(message = "E-mail invalido") String email,
        @NotNull(message = "Informe a funcao pretendida") Funcao funcao
) {
}
