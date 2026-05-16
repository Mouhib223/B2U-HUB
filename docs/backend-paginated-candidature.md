# Backend: Paginated Candidature Endpoint (Spring Boot)

This snippet shows how to implement a paginated endpoint for `Candidature` using Spring Data `Pageable`.

Add to your Spring Boot backend (Java):

1) Repository

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CandidatureRepository extends MongoRepository<Candidature, String> {
    Page<Candidature> findByEmail(String email, Pageable pageable);
}
```

2) Service

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CandidatureService {
    private final CandidatureRepository repo;

    public CandidatureService(CandidatureRepository repo) { this.repo = repo; }

    public Page<Candidature> getPaged(int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateCandidature"));
        if (email != null && !email.isEmpty()) {
            return repo.findByEmail(email, pageable);
        }
        return repo.findAll(pageable);
    }
}
```

3) Controller

```java
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/candidatures")
public class CandidatureController {
    private final CandidatureService service;

    public CandidatureController(CandidatureService service) { this.service = service; }

    @GetMapping
    public Map<String, Object> getPaged(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String email
    ) {
        Page<Candidature> p = service.getPaged(page, size, email);
        Map<String, Object> resp = new HashMap<>();
        resp.put("items", p.getContent());
        resp.put("total", p.getTotalElements());
        resp.put("page", p.getNumber());
        resp.put("size", p.getSize());
        return resp;
    }
}
```

Notes
- This example uses MongoDB repository but the Pageable approach is the same for JPA.
- Ensure `dateCandidature` is stored in a sortable format (e.g., `LocalDate` or ISO string).
- The controller returns a simple JSON object with `items` and `total` to match the frontend `getPaged` expectation.

Frontend
- The frontend `CandidatureService.getPaged(page,size,email)` expects this shape:
  `{ items: Candidature[], total: number }`.
- Query params are 0-based for `page` in this example.

Security
- Add authentication/authorization as needed (e.g., only allow users to query their own candidatures unless admin).

Testing
- Use `curl "http://localhost:8080/api/candidatures?page=0&size=10&email=user@example.com"` to test.
