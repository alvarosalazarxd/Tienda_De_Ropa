package ms_favorito.favorito.service;

import ms_favorito.favorito.model.Favorito;
import java.util.List;

public interface FavoritoService {
    List<Favorito> obtenerPorUsuarioId(Long usuarioId);
    Favorito agregarFavorito(Long usuarioId, Long productoId);
    void eliminarFavorito(Long usuarioId, Long productoId);
    void eliminarPorId(Long id);
}