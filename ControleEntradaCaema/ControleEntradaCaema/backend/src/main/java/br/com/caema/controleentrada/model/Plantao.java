package br.com.caema.controleentrada.model;

import br.com.caema.controleentrada.model.enums.Funcao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "plantoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plantao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Funcao funcao;

    @Column(name = "hora_assuncao", nullable = false)
    private LocalDateTime horaAssuncao;

    @Column(name = "hora_conclusao")
    private LocalDateTime horaConclusao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "concluido_por_id")
    private Usuario concluidoPor;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void aoCriar() {
        this.criadoEm = LocalDateTime.now();
        if (this.horaAssuncao == null) {
            this.horaAssuncao = LocalDateTime.now();
        }
    }

    @Transient
    public boolean isAberto() {
        return horaConclusao == null;
    }
}
