package ms_favorito.favorito.service;

import ms_favorito.favorito.model.Favorito;
import ms_favorito.favorito.repository.FavoritoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoritoServiceImpl implements FavoritoService {

    private final FavoritoRepository favoritoRepository;

    public FavoritoServiceImpl(FavoritoRepository favoritoRepository) {
        this.favoritoRepository = favoritoRepository;
    }

    @Override
    public List<Favorito> obtenerPorUsuarioId(Long usuarioId) {
        return favoritoRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public Favorito agregarFavorito(Long usuarioId, Long productoId) {
        return favoritoRepository.findByUsuarioIdAndProductoId(usuarioId, productoId)
                .orElseGet(() -> favoritoRepository.save(new Favorito(usuarioId, productoId)));
    }

    @Override
    @Transactional
    public void eliminarFavorito(Long usuarioId, Long productoId) {
        favoritoRepository.deleteByUsuarioIdAndProductoId(usuarioId, productoId);
    }

    @Override
    public void eliminarPorId(Long id) {
        favoritoRepository.deleteById(id);
    }
}