package br.com.caema.controleentrada.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "registros_visitantes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroVisitante {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome_visitante", nullable = false, length = 150)
    private String nomeVisitante;

    @Column(length = 255)
    private String endereco;

    @Column(length = 20)
    private String telefone;

    @Column(nullable = false, length = 14)
    private String cpf;

    @Column(name = "local_visita", nullable = false, length = 150)
    private String localVisita;

    @Column(name = "numero_cracha", length = 30)
    private String numeroCracha;

    @Column(name = "hora_entrada", nullable = false)
    private LocalDateTime horaEntrada;

    @Column(name = "hora_saida")
    private LocalDateTime horaSaida;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "registrado_por_id", nullable = false)
    private Usuario registradoPor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "saida_registrada_por_id")
    private Usuario saidaRegistradaPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plantao_entrada_id")
    private Plantao plantaoEntrada;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    void aoCriar() {
        LocalDateTime agora = LocalDateTime.now();
        this.criadoEm = agora;
        this.atualizadoEm = agora;
        if (this.horaEntrada == null) {
            this.horaEntrada = agora;
        }
    }

    @PreUpdate
    void aoAtualizar() {
        this.atualizadoEm = LocalDateTime.now();
    }

    @Transient
    public boolean isAberto() {
        return horaSaida == null;
    }
}
