package br.com.caema.controleentrada.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetarSenhaRequest(
        @NotBlank @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres") String novaSenha
) {
}
